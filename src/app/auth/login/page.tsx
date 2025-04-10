import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React from "react";

const Login = () => {
  return (
    <div className="grid content-center gap-4 pt-8">
      <Input placeholder="email" />
      <Input placeholder="password" />
      <Button variant={"outline"}>Login</Button>
    </div>
  );
};

export default Login;
