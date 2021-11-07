# Cchan
Cchan es un imageboard simple basado en la interfaz de la difunta web "voxed.net", hecho en nodejs usando express y el template renderer ejs.

## Setup
Esto sigue siendo un proyecto en desarrollo, pero es posible montar la web de manera simple, usando servicios PaaS como [heroku](https://www.heroku.com), [glitch](https://glitch.com/), [railway](https://railway.app/), etc que soporten la plataforma nodejs y adicionalmente una conexión a una base de datos de mongodb sea local o externa, junto con un medio de almacenamiento local, o en servicios como [cloudinary](https://cloudinary.com/), [imgbb](https://imgbb.com/) e [imgur](http://imgur.com/).
> Ejemplo:
se puede utilizar [railway](http://railway.app/) con una base de datos de mongodb integrada, y el almacenamiento volátil (teniendo en cuenta que este almacenamiento se resetea en cada actualizacion del git)

De otro modo, tecnicamente tambien es posible montarlo en un servidor dedicado, instalando npm y mongodb shell, clonando el repositorio en algún lado, en el directorio junto a app.js, crear el archivo .env donde van las variables de entorno y ejecutar "npm start".

## Variables de entorno necesarias
|VARIABLE|DESCRIPCIÓN|
|--|--|
|MONGOURI| La uri del servidor de la base de datos, por defecto si no esta definido se utiliza localhost:27017 |
|SSL| indica si se utilizará conexion segura, en una base de datos remota es obligatorio activar esta opción con "true"|
|DATABASE_CACHE| Indica si se utilizará el mecanismo de cacheo de la base de datos en memoria, por defecto esta en "true"|
|PORT| puerto interno que utilizará el servidor, por defecto es el 3000 pero depende del servidor.|
