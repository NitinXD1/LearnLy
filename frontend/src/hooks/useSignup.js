import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signup } from "../lib/api";


const useSignup = () => {
    const queryClient = useQueryClient();

    const {isPending,mutate,error} = useMutation(
        {
            mutationFn : signup,
            onSuccess : () => queryClient.invalidateQueries(["authUser"])
        }
    )

    return {isPending, signupMutation : mutate , error};
}

export default useSignup;