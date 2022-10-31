FROM dtr.premierinc.com/pcops_org/static-content-server:2.6.0.0

COPY files/assets/ /data/
COPY files/git.properties /app/resources/
