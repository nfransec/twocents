import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const formSchema = z.object({
  cardName: z.string().min(2, { message: "Card name must be at least 2 characters." }),
})

export function AddCardModal() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cardName: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    // Add your
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Add New Card</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Add New Card</DialogTitle>
        <Form onSubmit={onSubmit}>
          <FormField>
            <FormLabel>Card Name</FormLabel>
            <FormControl>
              <Input type="text" name="cardName" />
            </FormControl>
          </FormField>
          <FormItem>
            <Button type="submit" disabled={isLoading}>Add Card</Button>
          </FormItem>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
