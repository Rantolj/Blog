FROM php:8.2-apache

# Installation des dépendances pour GD (avec support WebP, JPEG, Freetype, PNG)
RUN apt-get update && apt-get install -y \
    libfreetype6-dev \
    libjpeg62-turbo-dev \
    libpng-dev \
    libwebp-dev \
    zlib1g-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install -j$(nproc) gd mysqli \
    && a2enmod rewrite

COPY docker/php-apache/vhost.conf /etc/apache2/sites-available/000-default.conf

WORKDIR /var/www/html
