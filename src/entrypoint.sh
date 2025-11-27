#!bin/sh

# Caminho para o arquivo JS dentro do container Nginx
SCRIPT_PATH="/usr/share/nginx/html/script.js"

# 1. Checa se a variável de ambiente FRONTEND_HOST foi definida
if [ -n "$FRONTEND_HOST" ]; then
  echo "Injetando FRONTEND_HOST=$FRONTEND_HOST no script.js..."
  
  # 2. Usa 'sed' para substituir a string placeholder ('__FRONTEND_HOST__') 
  # no arquivo JavaScript pelo valor da variável de ambiente.
  sed -i "s@__FRONTEND_HOST__@$FRONTEND_HOST@g" "$SCRIPT_PATH"
else
  echo "Variável FRONTEND_HOST não definida. Usando valores padrões (localhost)."
fi

# 3. Inicia o Nginx em foreground (comando final do container)
exec nginx -g "daemon off;"