FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy custom Nginx configuration
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy frontend assets
COPY index.html /usr/share/nginx/html/
COPY style.css /usr/share/nginx/html/
COPY config.js data.js flow-model.js vehicle-flow.js app.js /usr/share/nginx/html/
COPY traffic_data.json /usr/share/nginx/html/

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=3s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
