#!/bin/bash

echo "Adding to Config"

sed -i 's/80/8080/g' /usr/local/apache2/conf/httpd.conf

echo "LoadModule userdir_module modules/mod_userdir.so
LoadModule rewrite_module modules/mod_rewrite.so
LoadModule auth_openidc_module /usr/lib/apache2/modules/mod_auth_openidc.so
<Directory ~ /(users/)?u\d+/(u0/)?.*/\.html_pages>
	#php_admin_value engine Off
	Options	all MultiViews +Indexes
	DirectoryIndex index.html index.htm
	Require all granted
</Directory>
<VirtualHost *:8080>
    UserDir .html_pages
    DocumentRoot /usr/local/apache2/htdocs/
    RewriteEngine On

    OIDCRedirectURI $SERVER_NAME/sso/redirect
    OIDCXForwardedHeaders X-Forwarded-Host X-Forwarded-Proto X-Forwarded-Port Forwarded
    OIDCCryptoPassphrase $(tr -dc A-Za-z0-9 </dev/urandom | head -c 64 ; echo '')
    OIDCProviderMetadataURL https://sso.csh.rit.edu/auth/realms/csh/.well-known/openid-configuration
    OIDCSSLValidateServer On
    OIDCClientID $OIDC_CLIENT_ID
    OIDCClientSecret $OIDC_CLIENT_SECRET
    OIDCCookieDomain csh.rit.edu
    OIDCCookie sso_session
    OIDCSessionInactivityTimeout 1800
    OIDCSessionMaxDuration 28800
    OIDCDefaultLoggedOutURL https://csh.rit.edu
    OIDCRemoteUserClaim preferred_username
    OIDCInfoHook iat access_token access_token_expires id_token userinfo refresh_token 
   
    <Location />
        AuthType openid-connect
        Require valid-user

        Redirect /sso/logout /sso/redirect?logout=$SERVER_NAME
    </Location>

</VirtualHost>
" >> /usr/local/apache2/conf/httpd.conf

if test -f /etc/sssd/sssd.conf; then
    sssd -i &
fi

echo "Running: $@"
exec $@

