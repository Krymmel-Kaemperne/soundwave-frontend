FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf

# Copy static files
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY . /usr/share/nginx/html

EXPOSE 5500

CMD ["nginx", "-g", "daemon off;"]
