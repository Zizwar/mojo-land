const { username, password, phone, email } = mojo.body;
console.log({ username, password, phone, email });
if ((!username || !phone || !email) && !password)
  return mojo.json(
    { message: "require !username || !phone||!email or password !!" },
    402
  );

const queryBase = mojo.supabase
  .from("users")
  .select("token")
  .eq("password", password)

  .single();

if (username) queryBase.eq("username", username);
if (phone) queryBase.eq("phone", phone);
if (email) queryBase.eq("email", email);

const { data = [], error } = await queryBase;

if (error) return mojo.json({ message: "error  username or phone  or email or password !!" }, 402);
return mojo.json(data.length === 0 ? {} : data);
