drop database if exists 1000dangers;
create database 1000dangers;
use 1000dangers;
create table team(id int primary key, name varchar(50), password varchar(50));
create table 1000dangersbook(id int primary key, team_id int, name varchar(150), creationDate datetime, foreign key(team_id) references team(id));
create table paptype(id int primary key, name varchar(30));
create table papelement(id int primary key, 1000dangersbook_id int, paptype_id int, x int, y int, title varchar(200), text varchar(100000), foreign key(1000dangersbook_id) references 1000dangersbook(id), foreign key(paptype_id) references paptype(id));
create table paplink(source_id int, destination_id int, title varchar(2000), foreign key(source_id) references papelement(id), foreign key(destination_id) references papelement(id));
insert into team(id, name, password) values(1, "rene", "1234");
insert into 1000dangersbook(id, team_id, name, creationdate) values(1, 1, "1000 Gefahren", now());
insert into paptype(id, name) values(1, "Start"), (2, "End"), (3, "Text"), (4, "Condition");

