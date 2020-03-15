HVACmon Docker Container
===================================

Containerized hvacmon.js program.

1. Buld the Container.
I have included my own build script, but use what works for you.

<pre>
# Bump version number & build
VERSION=$(cat VERSION | perl -pe 's/^((\d+\.)*)(\d+)(.*)$/$1.($3+1).$4/e' | tee VERSION)
docker build -t jdallen/hvacmon:$VERSION -t jdallen/hvacmon:latest .
</pre>

2. Run the Container.

<pre>
docker run -d --restart=always \
  --name=hvacmon \
  --volume /root/Docker/HVACmon:/app/config \
  jdallen/hvacmon:latest
</pre>

Make sure your 'config.json' is in your volume directory before starting the container.


