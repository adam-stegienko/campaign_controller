def calculateVersion(latestTag) {
    def (major, minor, patch) = latestTag.tokenize('.')

    // Fetch the latest commit message
    def commitMessage = sh(returnStdout: true, script: 'git log -1 --pretty=%B').trim()

    // Increment the version based on conventional commit standards
    if (commitMessage.toLowerCase().contains('breaking change') || 
        commitMessage.toLowerCase().contains('major:') ||
        commitMessage.toLowerCase().startsWith('feat!') ||
        commitMessage.toLowerCase().startsWith('fix!')) {
        return 'major'
    } else if (commitMessage.toLowerCase().startsWith('feat') || 
               commitMessage.toLowerCase().contains('minor:')) {
        return 'minor'
    } else if (commitMessage.toLowerCase().startsWith('fix') ||
               commitMessage.toLowerCase().startsWith('docs') ||
               commitMessage.toLowerCase().startsWith('style') ||
               commitMessage.toLowerCase().startsWith('refactor') ||
               commitMessage.toLowerCase().startsWith('perf') ||
               commitMessage.toLowerCase().startsWith('test') ||
               commitMessage.toLowerCase().startsWith('chore') ||
               commitMessage.toLowerCase().contains('patch:')) {
        return 'patch'
    } else {
        return 'patch'  // Default to patch increment
    }
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
        APP_NAME = 'campaign-controller-ui'
        SONAR_SERVER = 'LabSonarQube'
        SONAR_PROJECT_NAME = 'campaign_controller'
        SONAR_PROJECT_KEY = 'campaign_controller'
        SONAR_SOURCES = './src'
        SONAR_SONAR_LOGIN = 'adam-stegienko'
        DOCKER_REGISTRY = 'registry.stegienko.com:8443'
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

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Calculate Version') {
            steps {
                script {
                    // Get current version from package.json
                    def currentPackageVersion = sh(returnStdout: true, script: 'node -p "require(\'./package.json\').version"').trim()
                    
                    // Get latest git tag
                    def latestTag = currentPackageVersion
                    try {
                        latestTag = sh(returnStdout: true, script: 'git tag | sort -Vr | head -n 1').trim()
                        if (!latestTag) {
                            latestTag = currentPackageVersion
                        }
                    } catch (Exception e) {
                        latestTag = currentPackageVersion
                    }
                    
                    def versionType = calculateVersion(latestTag)

                    // Check if the latest commit already has a tag
                    def latestCommitTag = ''
                    try {
                        latestCommitTag = sh(returnStdout: true, script: 'git tag --contains HEAD').trim()
                    } catch (Exception e) {}
                    
                    if (latestCommitTag) {
                        DUPLICATED_TAG = 'true'
                        env.APP_VERSION = currentPackageVersion
                        sh "echo 'Tag ${latestCommitTag} already exists for the latest commit. DUPLICATED_TAG env var is set to: '${DUPLICATED_TAG}"
                    } else {
                        sh "echo 'Current package.json version: ${currentPackageVersion}'"
                        sh "echo 'Latest git tag: ${latestTag}'"
                        sh "echo 'Version increment type: ${versionType}'"
                        sh "echo 'DUPLICATED_TAG: ${DUPLICATED_TAG}'"
                        
                        // Use npm version to increment and get the new version
                        env.APP_VERSION = sh(returnStdout: true, script: "npm version ${versionType} --no-git-tag-version").trim()
                        sh "echo 'New version: ${env.APP_VERSION}'"
                    }
                }
            }
        }

        stage('Build React App') {
            when {
                expression {
                    return currentBuild.currentResult == 'SUCCESS'
                }
            }
            steps {
                sh 'npm run build'
            }
        }

        stage('Run Tests') {
            when {
                expression {
                    return currentBuild.currentResult == 'SUCCESS'
                }
            }
            steps {
                sh 'CI=true npm test -- --coverage --watchAll=false'
            }
            post {
                always {
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'coverage/lcov-report',
                        reportFiles: 'index.html',
                        reportName: 'Coverage Report'
                    ])
                }
            }
        }

        stage('SonarQube analysis') {
            when {
                expression {
                    return currentBuild.currentResult == 'SUCCESS'
                }
            }
            steps {
                script {
                    scannerHome = tool 'JenkinsSonarScanner'
                }
                withSonarQubeEnv(env.SONAR_SERVER) {
                    sh "${scannerHome}/bin/sonar-scanner -Dsonar.projectKey=${env.SONAR_PROJECT_KEY} -Dsonar.projectName='${env.SONAR_PROJECT_NAME}' -Dsonar.projectVersion=${env.APP_VERSION}"
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
                sh "docker build --build-arg APP_VERSION=${env.APP_VERSION} -t ${env.DOCKER_REGISTRY}/${env.APP_NAME}:${env.APP_VERSION} ."
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
                        sh "git config --global user.email 'adam.stegienko1@gmail.com'"
                        sh "git config --global user.name 'Adam Stegienko'"
                        
                        // Add the updated package.json and package-lock.json
                        sh "git add package.json package-lock.json"
                        sh "git commit -m 'chore: bump version to ${env.APP_VERSION} [skip ci]'"
                        
                        // Create and push tag (x.y.z format, no 'v' prefix)
                        sh "git tag ${env.APP_VERSION}"
                        sh "git push origin master"
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
