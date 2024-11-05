#!/bin/bash

# Function to handle invalid arguments
usage() {
  echo "Usage: $0 <action> <files...>"
  echo "  action: (decrypt | encrypt)"
  echo "  files: List of files to encrypt or decrypt"
  exit 1
}

# Check for required arguments
if [ $# -ne 1 ]; then
  usage
fi

# Action (decrypt or encrypt)
action="$1"
files=(
  "configmap.yaml"
  ".env"
  ".env.develop"
  ".env.staging"
  ".env.prod"
)

# Validate action argument
if [ "$action" != "decrypt" ] && [ "$action" != "encrypt" ]; then
  echo "Invalid action: '$action'"
  usage
fi

# Read password securely from the .encrypt.password file
password_file=".encrypt.password"

# Iterate over each file and perform the action
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    if [ "$action" == "decrypt" ]; then
      ansible-vault decrypt "$file" --vault-password-file "$password_file"
      echo "Decrypted '$file'"
    elif [ "$action" == "encrypt" ]; then
      ansible-vault encrypt "$file" --vault-password-file "$password_file"
      echo "Encrypted '$file'"
    fi
  else
    echo "File not found: '$file'"
  fi
done