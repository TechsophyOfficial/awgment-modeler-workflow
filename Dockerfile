FROM nginx:1.17.8-alpine
RUN mkdir -p /usr/share/nginx/html/model/process
COPY build/. /usr/share/nginx/html/model/process
RUN chown -R nginx:nginx /usr/share/nginx/html
WORKDIR /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
