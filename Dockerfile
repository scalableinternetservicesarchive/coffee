FROM gcr.io/distroless/nodejs:12

COPY server/bin /bin

EXPOSE 3000

WORKDIR /bin
CMD ["server/src/server.js"]
