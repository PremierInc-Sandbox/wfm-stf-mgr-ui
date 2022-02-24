FROM dtr.premierinc.com/pcops_org/static-content-server:2.6.0.0

COPY dist/ /data/
COPY git.properties /app/resources/
