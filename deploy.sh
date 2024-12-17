sed -i "s|^REACT_APP_API_URL=.*|REACT_APP_API_URL='http://52.66.145.64:8080/mandi-dev/'|" .env
npm run build
scp -i ./mandi-server-curr.pem -r build/ ubuntu@52.66.145.64:/home/ubuntu/mandiAuctionDev
ssh -i ./mandi-server-curr.pem ubuntu@52.66.145.64 << EOF
  cd /var/www
  sudo ./deploy_mandi_app_auction_dev.sh
EOF