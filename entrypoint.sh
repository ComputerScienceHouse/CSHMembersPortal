#!/bin/bash

echo "Adding to Config"

sed -i 's/80/8080/g' /usr/local/apache2/conf/httpd.conf

sed -i 's/LoadModule mpm_event_module/#LoadModule mpm_event_module/g' /usr/local/apache2/conf/httpd.conf

echo "LoadModule userdir_module modules/mod_userdir.so
LoadModule rewrite_module modules/mod_rewrite.so
LoadModule headers_module modules/mod_headers.so
LoadModule auth_openidc_module /usr/lib/apache2/modules/mod_auth_openidc.so

# Hey future RTP, if you want to turn PHP/Perl back on, uncomment this
# LoadModule php_module /usr/lib/apache2/modules/libphp8.2.so
# LoadModule perl_module /usr/lib/apache2/modules/mod_perl.so

LoadModule mpm_prefork_module modules/mod_mpm_prefork.so

<FilesMatch \.php$>
    # Switch these to allow php
    deny from all
    # SetHandler application/x-httpd-php
</FilesMatch>

<FilesMatch \.(cgi|pl)$>
    # Switch these to allow perl
    deny from all
    # SetHandler perl-script
    # PerlResponseHandler ModPerl::PerlRun
    # PerlOptions +ParseHeaders
    # Options +ExecCGI
</FilesMatch>

IndexOptions FancyIndexing HTMLTable VersionSort
Alias /icons/ "/usr/local/apache2/icons/"
<Directory "/usr/local/apache2/icons">
    Options Indexes MultiViews FollowSymlinks
    AllowOverride None
    Require all granted
</Directory>
AddIconByEncoding (CMP,/icons/compressed.gif) x-compress x-gzip
AddIconByType (TXT,/icons/text.gif) text/*
AddIconByType (IMG,/icons/image2.gif) image/*
AddIconByType (SND,/icons/sound2.gif) audio/*
AddIconByType (VID,/icons/movie.gif) video/*
AddIcon /icons/binary.gif .bin .exe
AddIcon /icons/binhex.gif .hqx
AddIcon /icons/tar.gif .tar
AddIcon /icons/world2.gif .wrl .wrl.gz .vrml .vrm .iv
AddIcon /icons/compressed.gif .Z .z .tgz .gz .zip
AddIcon /icons/a.gif .ps .ai .eps
AddIcon /icons/layout.gif .html .shtml .htm .pdf
AddIcon /icons/text.gif .txt
AddIcon /icons/c.gif .c
AddIcon /icons/p.gif .pl .py
AddIcon /icons/f.gif .for
AddIcon /icons/dvi.gif .dvi
AddIcon /icons/uuencoded.gif .uu
AddIcon /icons/script.gif .conf .sh .shar .csh .ksh .tcl
AddIcon /icons/tex.gif .tex
AddIcon /icons/bomb.gif /core
AddIcon /icons/bomb.gif */core.*
AddIcon /icons/back.gif ..
AddIcon /icons/hand.right.gif README
AddIcon /icons/folder.gif ^^DIRECTORY^^
AddIcon /icons/blank.gif ^^BLANKICON^^
DefaultIcon /icons/unknown.gif
ReadmeName README.html
HeaderName HEADER.html

<Directory ~ /(users/)?u\d+/(u0/)?.*/\.html_pages>
	Options	all MultiViews +Indexes
	DirectoryIndex index.html index.htm
	AllowOverride All
	Require all granted
</Directory>

<VirtualHost *:8080>
    UserDir .html_pages
    DocumentRoot /usr/local/apache2/htdocs/
    RewriteEngine On
    ServerName $SERVER_NAME
    UseCanonicalName On
    UseCanonicalPhysicalPort Off

    OIDCRedirectURI $HTTP_SCHEME://$SERVER_NAME/sso/redirect" >> /usr/local/apache2/conf/httpd.conf

if [ "$HTTP_SCHEME" = "https" ]; then
	echo "OIDCXForwardedHeaders X-Forwarded-Host X-Forwarded-Proto X-Forwarded-Port Forwarded" >> /usr/local/apache2/conf/httpd.conf
fi

echo "OIDCCryptoPassphrase $(tr -dc A-Za-z0-9 </dev/urandom | head -c 64 ; echo '')
    OIDCProviderMetadataURL https://sso.csh.rit.edu/auth/realms/csh/.well-known/openid-configuration
    OIDCSSLValidateServer On
    OIDCClientID $OIDC_CLIENT_ID
    OIDCClientSecret $OIDC_CLIENT_SECRET
    OIDCCookieDomain $OIDC_COOKIE_DOMAIN
    OIDCCookie sso_session
    OIDCSessionInactivityTimeout 1800
    OIDCSessionMaxDuration 28800
    OIDCDefaultLoggedOutURL https://csh.rit.edu
    OIDCRemoteUserClaim preferred_username
    OIDCInfoHook iat access_token access_token_expires id_token userinfo refresh_token 
   
    <Location />
        AuthType openid-connect
        Require valid-user

        Redirect /sso/logout /sso/redirect?logout=$HTTP_SCHEME://$SERVER_NAME
    </Location>
    Alias /history /users/u15/dtyler/.html_pages/History
</VirtualHost>
" >> /usr/local/apache2/conf/httpd.conf

if test -f /etc/sssd/sssd.conf; then
    sssd -i &
fi

echo "Running: $@"
exec $@

