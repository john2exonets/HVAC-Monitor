VERSION=$(cat VERSION | perl -pe 's/^((\d+\.)*)(\d+)(.*)$/$1.($3+1).$4/e' | tee VERSION)
/usr/bin/cp --force /mnt/Dev/_Node.JS/_HoneywellTotalComfort/hvacmon.js .
docker build -t jdallen/hvacmon:$VERSION -t jdallen/hvacmon:latest .

