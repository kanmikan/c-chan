# Cchan
Cchan es un imageboard usando voxels derivado del estilo de voxed.net, hecho con nodejs usando express y el template renderer ejs.

![home](https://i.ibb.co/JvXBDvJ/aksdasidakisdkaisidasd.png)

![editor](https://i.ibb.co/vmcyQwx/okasdkoskodaokoskdakos.png)

![temas](https://i.ibb.co/RBjv5wr/kaosdkoaokdoasodkakos.png)

## Setup
### Montar en Heroku
- descargar el repositorio
- crear una cuenta de mongodb atlas
- crear una cuenta en heroku y descargar su herramienta cli
- crear un proyecto en heroku y seguir las instrucciones
- añadir las variables de entorno necesarias
### Montar en Railway
- clonar el repositorio o descargarlo 
- crear tu propia cuenta de github, y subir el codigo en un repositorio
- crear un proyecto en railway y pasarle ese repositorio
- configurar las variables de entorno y la base de datos integrada u opcionalmente crearse una en mongodb atlas
### Montar en un server
- No tengo un server para testear, pero supongo que es suficiente clonando el repositorio en el server y ejecutando npm install && npm start o npm run watch
Tambien harian falta configurar la base de datos y las variables de entorno

## Variables de entorno
|VARIABLE|EJEMPLO|DESCRIPCIÓN|ES|
|--|--|--|--|
|MONGOURI|mongodb://user:pass@host:puerto/db| La uri del servidor de la base de datos, por defecto si no esta definido se utiliza localhost:27017 y la base de datos "mikandbv2" |Necesaria
|PORT|3000|puerto interno que utilizará el servidor, por defecto es el 3000 pero depende del servidor.|Necesaria
|SSL|true| indica si se utilizará conexion segura, en una base de datos remota es obligatorio activar esta opción con "true"|Necesaria, true en un server, false en localhost
|IMG_SERVER|4|Indica el servidor de imagenes que se va a utilizar, por defecto es 0, osea, guarda las imagenes en el servidor local y las expone como archivos estáticos en la ruta /uploads/, para desactivar las subidas en general se usa el 9|No necesaria dependiendo del setup.
|VIDEO_SERVER|0|Indica el servidor de subida de videos que se va a utilizar, por defecto es 0, para desactivar las subidas en general se usa el 9|No necesaria dependiendo del setup.
|YOUTUBE_API_KEY|se obtiene de youtube|En la mv2 se utiliza para obtener los titulos de los videos|desde la alfa 5 es necesaria para linkear videos de youtube.
|CRON_THREADS|false|Activa o desactiva los threads del heartbeat de los bots, si existen|No necesaria
|CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET|se obtiene de cloudinary|Se usan para conectarse a una cuenta de cloudinary|Obligatorio si se configuraron las subidas de imagenes o videos a cloudinary, de lo contrario es irrelevante.
|IMGBB_API_KEY|se obtiene de imgbb|Se usa para conectarse a imgbb|Obligatorio si se configura las subidas de imagenes a imgbb.
|YUU_BLACKLIST|jugo,sed,bla,etc|La lista negra de frases o palabras que alerta al yuubot|Es necesario definir al menos una
