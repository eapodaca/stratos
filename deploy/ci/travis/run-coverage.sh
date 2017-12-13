#!/bin/bash

set -e

echo "Running code coverage tests..."

cat << EOF > ./build/secrets.json
{
  "headless": true,
  "cloudFoundry": {
    "url": "${CF_LOCATION}",
    "admin": {
      "username": "${CF_ADMIN_USER}",
      "password": "${CF_ADMIN_PASSWORD}"
    },
    "user": {
      "username": "${CF_E2E_USER}",
      "password": "${CF_E2E_USER_PASSWORD}"
    }
  },
  "console": {
    "host": "localhost",
    "port": 443,
    "admin": {
      "username": "${CONSOLE_ADMIN_USER}",
      "password": "${CONSOLE_ADMIN_PASSWORD}"
    },
    "user": {
      "username": "${CONSOLE_USER_USER}",
      "password": "${CONSOLE_USER_PASSWORD}"
    }
  },
  "uaa": {
    "url": "http://uaa:8080",
    "clientId": "console",
    "adminUsername": "admin",
    "adminPassword": "hscadmin"
  }
}
EOF

echo "Generating certificate"
export CERTS_PATH=./dev-certs
./deploy/tools/generate_cert.sh

# Move the node_modules folder - the docker build will remove it anyway
mv ./node_modules /tmp/node_modules
mv ./bower_components /tmp/bower_components

echo "Building images locally with instrumented front-end code"
./deploy/docker-compose/build.sh -n -l -i
echo "Build Finished"
docker images

echo "Running Console in Docker Compose"
pushd deploy/ci/travis
docker-compose up -d
popd

# The build cleared node_modules, so move back the one we kept
#npm install
rm -rf ./node_modules
mv /tmp/node_modules ./node_modules
rm -rf ./bower_components
mv /tmp/bower_components ./bower_components

echo "Running Front-end Unit Tests"
set +e
#npm run coverage
gulp e2e:tests
RESULT=$?
set -e

pushd deploy/ci/travis
# Uncomment to copy logs to the travis log
#docker-compose stop
#docker-compose logs mariadb
#docker-compose logs goose
#docker-compose logs proxy 
docker-compose down
popd

echo "Uploading code coverage reports"
cd out
bash <(curl -s https://codecov.io/bash)

exit $RESULT
