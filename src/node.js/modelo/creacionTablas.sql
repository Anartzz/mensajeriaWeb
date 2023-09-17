use mensajeriaWeb;
drop table participantes_grupo cascade;
drop table mensajes_chat cascade;
drop table mensajes_grupo cascade;
drop table grupos cascade;
drop table chats cascade;
drop table usuarios cascade;


create table usuarios (
	id int auto_increment primary key,
	nombre varchar(10),
    contrasenna varchar(64),
    foto varchar(300)
);

create table chats (
	id int auto_increment,
	usuario1 int references usuarios(id),
    usuario2 int references usuarios(id),
    primary key (id)
);

create table grupos (
	id int auto_increment primary key,
    nombre varchar(20),
    foto varchar(300)
);

create table mensajes_grupo (
	usuario_id int,
    id_grupo int,
    texto varchar(200),
    fecha_hora datetime,
    foreign key (usuario_id) references usuarios(id) on delete cascade,
    foreign key (id_grupo) references grupos(id) on delete cascade,
    primary key (usuario_id, id_grupo)
);

create table mensajes_chat (
    id int auto_increment, 
	usuario_id int,
    chat_id int,
    texto varchar(200),
    fecha_hora datetime,
    leido tinyint(1) default 0,
    foreign key (usuario_id) references usuarios(id),
    foreign key (chat_id) references chats(id),
    primary key (id)
);

create table participantes_grupo (
	grupo_id int,    
    usuario_id int,
    foreign key (grupo_id) references grupos(id),
    foreign key (usuario_id) references usuarios(id),
    primary key (grupo_id, usuario_id)
);