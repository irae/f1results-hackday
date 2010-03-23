USE "http://github.com/irae/yql-tables/raw/master/formula1/formula1.races.xml?1" AS formula1.races;
select * from formula1.races where season="2009";

USE "http://github.com/irae/yql-tables/raw/master/formula1/formula1.races.xml?1" AS formula1.races;
select round from formula1.races where season="2009";


USE "http://irae.pro.br/code/yql.formula1/formula1.race.results.xml?4" AS formula1.race.results;
select * from formula1.race.results where season="2009" and race in (1,2,3,4,5);





USE "http://github.com/irae/yql-tables/raw/master/formula1/formula1.races.xml?5" AS formula1.races;
USE "http://github.com/irae/yql-tables/raw/master/formula1/formula1.race.results.xml?5" AS formula1.race.results;
select * from formula1.race.results where season="2009" and race in (select round from formula1.races where season="2009");



USE "http://github.com/irae/yql-tables/raw/master/formula1/formula1.races.xml?5" AS formula1.races;
USE "http://github.com/irae/yql-tables/raw/master/formula1/formula1.race.results.xml?5" AS formula1.race.results;

select *
	from formula1.race.results
		where season="2009" and race in (
			select round from formula1.races where season="2009"
		);
