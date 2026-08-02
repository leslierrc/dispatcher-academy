-- Los planes de cada curso se venden mensuales, pero createCourse()
-- los creaba con interval = 'one_time' (y el checkout usaba
-- mode: "payment", que ni siquiera acepta un precio recurrente). Ya
-- se corrigió el código; esto pone al día los planes ya creados.
-- Si algún plan ya tiene un stripe_price_id de un intento anterior,
-- se limpia para que el próximo checkout genere un Price de Stripe
-- nuevo con el interval correcto (uno "one_time" viejo no sirve para
-- una Checkout Session en modo subscription).
update public.plans
set stripe_price_id = null
where interval = 'one_time' and stripe_price_id is not null;

update public.plans
set interval = 'month'
where interval = 'one_time';
