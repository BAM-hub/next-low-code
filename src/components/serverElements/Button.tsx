import { Button } from "@/components/ui/button";

type Props = { title: string };

const ServerButton = ({ title }: Props) => {
  return <Button>{title}</Button>;
};

export default ServerButton;
