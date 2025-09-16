import { useNavigate, To, NavigateOptions } from "react-router-dom";

export const useAppNavigate = () => {
  const navigate = useNavigate();

  return {
    push: (to: To, options?: NavigateOptions) => {
      navigate(to, { ...options, replace: false });
    },
    replace: (to: To, options?: NavigateOptions) => {
      navigate(to, { ...options, replace: true });
    },
  };
};