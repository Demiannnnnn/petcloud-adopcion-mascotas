#!/bin/bash
# Script para generar certificado SSL autofirmado para Nginx

mkdir -p nginx/ssl

# Generar certificado autofirmado válido por 365 días
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/nginx-selfsigned.key \
  -out nginx/ssl/nginx-selfsigned.crt \
  -subj "/C=US/ST=State/L=City/O=Organization/OU=Department/CN=localhost"

echo "✅ Certificado SSL generado en nginx/ssl/"
echo "⚠️  Este es un certificado autofirmado para desarrollo."
echo "   Tu navegador mostrará una advertencia de seguridad."
echo "   Puedes aceptarla manualmente para continuar."

chmod 644 nginx/ssl/nginx-selfsigned.crt
chmod 600 nginx/ssl/nginx-selfsigned.key

echo "✅ Permisos configurados correctamente."
