# truck-orm / example

This example is made up of an angular web app `example-client` and laravel backend `example-api`.

Use [Laravel Valet](https://laravel.com/docs/5.3/valet) to make api accessible at `https://example-api.dev`:
```
cd example-api
composer install
valet link
valet secure
```

Run client:
```
cd example-client
npm i
npm start
```
