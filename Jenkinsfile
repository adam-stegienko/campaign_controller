def calculateVersion(latestTag) {
    def (major, minor, patch) = latestTag.tokenize('.')

    // Fetch the latest commit message
    def commitMessage = sh(returnStdout: true, script: 'git log -1 --pretty=%B').trim()

    // Increment the version based on the commit message
    if (commitMessage.contains('major')) {
        major = major.toInteger() + 1
        minor = '0'
        patch = '0'
    } else if (commitMessage.contains('minor')) {
        minor = minor.toInteger() + 1
        patch = '0'
    } else {
        patch = patch.toInteger() + 1
    }

    return "${major}.${minor}.${patch}"
}

def cleanGit() {
    sh 'git fetch --all'
    sh 'git reset --hard'
    sh 'git clean -fdx'
}

def DUPLICATED_TAG = 'false'

pipeline {
    agent any
    environment {
        APP_NAME = 'campaign_controller'
        SONAR_SERVER = 'LabSonarQube'
        SONAR_PROJECT_NAME = 'campaign_controller'
        SONAR_PROJECT_KEY = 'campaign_controller'
        SONAR_SOURCES = './src'
        SONAR_SONAR_LOGIN = 'adam-stegienko'
        DOCKER_REGISTRY = 'registry.stegienko.com:8443'
        REACT_APP_CAMPAIGN_CONTROLLER_API_URL = 'https://campaign-controller.stegienko.com:8443'
        REACT_APP_GOOGLE_ADS_CUSTOMER_ID = '5898340090'
        REACT_APP_GOOGLE_ADS_CAMPAIGN_NAMES = 'Przeprowadzki,Transport,Magazynowanie'
    }
    options {
        timestamps()
    }
    tools {
        maven 'Maven'
        jdk 'JDK'
        dockerTool '26.1.1'
        nodejs 'NodeJS'
    }
    stages {

        stage('Start') {
            steps {
                script {
                    step([$class: "GitHubPRStatusBuilder", statusMessage: [content: "Pipeline started"]])
                    step([$class: "GitHubCommitStatusSetter", statusResultSource: [$class: "ConditionalStatusResultSource", results: [[$class: "AnyBuildResult", message: "Build started", state: "PENDING"]]]])
                }
            }
        }

        stage('Clean Workspace') {
            steps {
                sshagent(['jenkins_github_np']) {
                    cleanGit()
                    sh 'git tag -d $(git tag -l) > /dev/null 2>&1'
                }
            }
        }

        stage('Checkout') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/master']],
                    doGenerateSubmoduleConfigurations: 'false',
                    extensions: [
                        [$class: 'CloneOption', noTags: false, shallow: false]
                    ],
                    submoduleCfg: [],
                    userRemoteConfigs: [[
                        credentialsId: 'jenkins_github_np',
                        url: 'git@github.com:adam-stegienko/campaign_controller.git'
                    ]]
                ])
            }
        }

        stage('Calculate Version') {
            steps {
                script {
                    def latestTag = '0.0.0'
                    try {
                        latestTag = sh(returnStdout: true, script: 'git tag | sort -Vr | head -n 1').trim()
                    } catch (Exception e) {}
                    env.APP_VERSION = calculateVersion(latestTag)

                    // Check if the latest commit already has a tag
                    def latestCommitTag = ''
                    try {
                        latestCommitTag = sh(returnStdout: true, script: 'git tag --contains HEAD').trim()
                    } catch (Exception e) {}
                    if (latestCommitTag) {
                        DUPLICATED_TAG = 'true'
                        sh "echo 'Tag ${latestCommitTag} already exists for the latest commit. DUPLICATED_TAG env var is set to: '${DUPLICATED_TAG}"
                    } else {
                        sh "echo ${latestTag} '->' ${env.APP_VERSION}"
                        sh "echo DUPLICATED_TAG: ${DUPLICATED_TAG}"
                    }
                }
            }
        }

        // stage('Provide Config File') {
        //     steps {
        //         configFileProvider([configFile(fileId: '35c99061-027f-457b-87e9-e5950705128a', targetLocation: 'src/main/resources/application.properties')]) {}
        //     }
        // }

        stage('SonarQube analysis') {
            steps {
                script {
                    scannerHome = tool 'JenkinsSonarScanner'
                }
                withSonarQubeEnv(env.SONAR_SERVER) {// If you have configured more than one global server connection, you can specify its name as configured in Jenkins
                sh "${scannerHome}/bin/sonar-scanner -Dsonar.projectKey=${env.SONAR_PROJECT_KEY} -Dsonar.projectName='${env.SONAR_PROJECT_NAME}'"
                }
            }
        }

        stage('Docker Build') {
            when {
                expression {
                    return currentBuild.currentResult == 'SUCCESS'
                }
            }
            steps {
                sh "docker build --build-arg APP_VERSION=${env.APP_VERSION} --build-arg REACT_APP_CAMPAIGN_CONTROLLER_API_URL=${env.REACT_APP_CAMPAIGN_CONTROLLER_API_URL} --build-arg REACT_APP_GOOGLE_ADS_CUSTOMER_ID=${env.REACT_APP_GOOGLE_ADS_CUSTOMER_ID} --build-arg REACT_APP_GOOGLE_ADS_CAMPAIGN_NAMES=${env.REACT_APP_GOOGLE_ADS_CAMPAIGN_NAMES} -t ${env.DOCKER_REGISTRY}/${env.APP_NAME}:${env.APP_VERSION} ."
            }
        }

        stage('Docker Image Security Scan') {
            when {
                expression {
                   return currentBuild.currentResult == 'SUCCESS'
                }
            }
            steps {
                sh "docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image --severity HIGH,CRITICAL --exit-code 0 ${env.DOCKER_REGISTRY}/${env.APP_NAME}:${env.APP_VERSION}"
            }
        }

        stage('Docker Push') {
            when {
                expression {
                    return currentBuild.currentResult == 'SUCCESS' && DUPLICATED_TAG == 'false'
                }
            }
            steps {
                script {
                    docker.withRegistry("https://${env.DOCKER_REGISTRY}", "docker_registry_credentials") {
                        def appImage = docker.image("${env.DOCKER_REGISTRY}/${env.APP_NAME}:${env.APP_VERSION}")
                        appImage.push()
                        appImage.push('latest')
                    }
                }
            }
        }

        stage('Update version, Tag, and Push to Git') {
            when {
                expression {
                    return currentBuild.currentResult == 'SUCCESS' && DUPLICATED_TAG == 'false'
                }
            }
            steps {
                script {
                    sshagent(['jenkins_github_np']) {
                        cleanGit()
                        sh "git config --global user.email 'adam.stegienko1@gmail.com'"
                        sh "git config --global user.name 'Adam Stegienko'"
                        sh "git tag ${env.APP_VERSION}"
                        sh "git push origin tag ${env.APP_VERSION}"
                    }
                }
            }
        }
    }
    post {
        always {
            script {
                try {
                    if (currentBuild.currentResult == 'SUCCESS') {
                        step([$class: "GitHubCommitStatusSetter", statusResultSource: [
                            $class: "ConditionalStatusResultSource",
                            results: [[$class: "BetterThanOrEqualBuildResult", message: "Build succeeded", state: "SUCCESS"]]
                        ]])
                        step([$class: "githubPRStatusPublisher",
                            statusMsg: [content: "Build succeeded"],
                            unstableAs: "SUCCESS"
                        ])
                    } else if (currentBuild.currentResult == 'FAILURE') {
                        step([$class: "GitHubCommitStatusSetter", statusResultSource: [
                            $class: "ConditionalStatusResultSource",
                            results: [[$class: "BetterThanOrEqualBuildResult", message: "Build failed", state: "FAILURE"]]
                        ]])
                        step([$class: "githubPRStatusPublisher",
                            statusMsg: [content: "Build failed"],
                            unstableAs: "FAILURE"
                        ])
                    } else {
                        step([$class: "GitHubCommitStatusSetter", statusResultSource: [
                            $class: "ConditionalStatusResultSource",
                            results: [[$class: "AnyBuildResult", message: "Build aborted. Result: ${currentBuild.currentResult}", state: "ERROR"]]
                        ]])
                        step([$class: "githubPRStatusPublisher",
                            statusMsg: [content: "Build aborted. Result: ${currentBuild.currentResult}"],
                            unstableAs: "ERROR"
                        ])
                    }
                } catch (Exception e) {
                    // Suppress/log nothing
                }
            }
            emailext body: "Build ${currentBuild.currentResult}: Job ${env.JOB_NAME} build ${env.BUILD_NUMBER}\nMore info at: ${env.BUILD_URL}",
                from: 'jenkins+blueflamestk@gmail.com',
                subject: "${currentBuild.currentResult}: Job '${env.JOB_NAME}' (${env.BUILD_NUMBER})",
                to: 'adam.stegienko1@gmail.com'
        }
    }
}
