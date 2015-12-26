create database if not exists 1998294_db;
use 1998294_db;
drop table if exists papconnection;
drop table if exists papelement;
drop table if exists paptype;
drop table if exists 1000dangersbook;
drop table if exists team;
create table team(id int auto_increment primary key, name varchar(50), password varchar(50));
create table 1000dangersbook(id int auto_increment primary key, team_id int, name varchar(150), creationDate datetime, foreign key(team_id) references team(id));
create table paptype(id int auto_increment primary key, name varchar(30));
create table papelement(id int, 1000dangersbook_id int, paptype_id int, x int, y int, title varchar(200), text text, primary key(id, 1000dangersbook_id), foreign key(1000dangersbook_id) references 1000dangersbook(id), foreign key(paptype_id) references paptype(id));
create table papconnection(source_id int, destination_id int, 1000dangersbook_id int, source_offset_x int, source_offset_y int, destination_offset_x int, destination_offset_y int, title varchar(200), text text, primary key(source_id, destination_id, 1000dangersbook_id), foreign key(source_id, 1000dangersbook_id) references papelement(id, 1000dangersbook_id), foreign key(destination_id, 1000dangersbook_id) references papelement(id, 1000dangersbook_id));
insert into team(id, name, password) values(1, "rene", "1234");
insert into 1000dangersbook(id, team_id, name, creationdate) values(1, 1, "1000 Gefahren", now());
insert into paptype(id, name) values(1, "Start"), (2, "End"), (3, "Action"), (4, "Condition");
insert into papelement(id, 1000dangersbook_id, paptype_id, x, y, title, text) values(1, 1, 1, 517, 6, "Start", "");
insert into papelement(id, 1000dangersbook_id, paptype_id, x, y, title, text) values(2, 1, 2, 535, 525, "Ende", "");
insert into papelement(id, 1000dangersbook_id, paptype_id, x, y, title, text) values(3, 1, 3, 502, 159, "Insel gestrandet", "Du hast Schiffbruch erlitten. Nachdem du dich auf eine einsame Insel gerettet hast, begegnen dir 5 Kannibalen.");
insert into papelement(id, 1000dangersbook_id, paptype_id, x, y, title, text) values(4, 1, 4, 797, 85, "Kannibalen kennenlernen?", "Moechtest du dich erstmal mit den Kannibalen anfreunden?");
insert into papelement(id, 1000dangersbook_id, paptype_id, x, y, title, text) values(5, 1, 3, 1015, 333, "Vor Kannibalen fliehen", "Du hast dich dazu entschieden, vor, vor den Kannibalen zu fliehen. Auf der Flucht stolperst du und verblutest qualvoll.");
insert into papelement(id, 1000dangersbook_id, paptype_id, x, y, title, text) values(6, 1, 3, 586, 398, "Mit Kannibalen anfreunden", "Du lernst die Kannibalen kennen. Sie sind viel netter, als man sonst so liest. Sie organisieren fuer dich die Heimreise. 6 Wochen spaeter bist du zu Hause.");
insert into papconnection(source_id, destination_id, 1000dangersbook_id, source_offset_x, source_offset_y, destination_offset_x, destination_offset_y, title) values(4, 6, 1, 30, 150, 20, 20, "ja");
/*
insert into papconnection(source_id, destination_id, 1000dangersbook_id, source_offset_x, source_offset_y, destination_offset_x, destination_offset_y, title) values(1, 2, 1, 0, 0, 0, 0, "Eine Verbindung");
insert into papconnection(source_id, destination_id, 1000dangersbook_id, source_offset_x, source_offset_y, destination_offset_x, destination_offset_y, title) values(1, 3, 1, 0, 0, 0, 0, "Titel der Verbindung");
insert into papconnection(source_id, destination_id, 1000dangersbook_id, source_offset_x, source_offset_y, destination_offset_x, destination_offset_y, title) values(2, 4, 1, 0, 0, 0, 0, "Verbindungstitel");
*/
 

