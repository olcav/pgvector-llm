alter table chunks
add column tags text[];

update chunks set tags = array['fun', 'songs'] where id = 3 or id =2;
update chunks set tags = array['bio'] where id = 0 or id = 1;

select * from chunks where tags && array['bio', 'songs'];
