FROM docker.io/httpd:2.4

RUN apt update && apt install -y sssd ca-certificates libapache2-mod-auth-openidc libapache2-mod-perl2 php libapache2-mod-php8.4

RUN chmod 777 /usr/local/apache2/conf ; chmod 777 /usr/local/apache2/logs
RUN chmod 666 /usr/local/apache2/conf/httpd.conf

RUN rm -rf /usr/local/apache2/htdocs/*
COPY . /usr/local/apache2/htdocs/

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["httpd-foreground"]
