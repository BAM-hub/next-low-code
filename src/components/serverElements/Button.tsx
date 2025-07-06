import { Button } from "@/components/ui/button";

type Props = { title: string };

const ServerButton = ({ title, ...props }: Props) => {
  return <Button {...props}>{title}</Button>;
};

export default ServerButton;
