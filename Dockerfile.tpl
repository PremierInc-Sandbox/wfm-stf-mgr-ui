FROM dtr.premierinc.com/pcops_org/static-content-server:${static_server_version}

COPY dist/ /data/
COPY git.properties /app/resources/
