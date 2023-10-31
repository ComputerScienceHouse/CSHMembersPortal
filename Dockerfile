FROM docker.io/httpd:2.4

RUN apt update && apt install -y sssd ca-certificates libapache2-mod-auth-openidc

RUN rm -rf /usr/local/apache2/htdocs/*
COPY . /usr/local/apache2/htdocs/

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["httpd-foreground"]
