sed -i "s|^REACT_APP_API_URL=.*|REACT_APP_API_URL='http://52.66.145.64:8080/mandi/'|" .env
npm run build
scp -i ./mandi-server-curr.pem -r build/ ubuntu@52.66.145.64:/home/ubuntu/mandiAuction
ssh -i ./mandi-server-curr.pem ubuntu@52.66.145.64 << EOF
  cd /var/www
  sudo ./deploy_mandi_auction.sh
EOF
sed -i "s|^REACT_APP_API_URL=.*|REACT_APP_API_URL='http://52.66.145.64:8080/mandi-dev/'|" .env
