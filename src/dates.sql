alter table chunks
add column indexing_date timestamp with time zone default now() - (random() * interval '1 month');

alter table chunks
drop column indexing_date;
