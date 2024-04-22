const { username, password, email,phone } = mojo.body;

if (!username && !password && !email && !phone)
  return mojo.json(
    { message: "require username and email and password !!" },
    402
  );

const token = mojo.generate();
const { data = [], error } = await mojo.supabase
  .from("users")
  .insert({ username, password, email,phone, status: "new", token })
  .select("token")
  .single();

if (error)
  return mojo.json(
    { message: "error username or password or email !!", error },
    402
  );
return mojo.json(data);
