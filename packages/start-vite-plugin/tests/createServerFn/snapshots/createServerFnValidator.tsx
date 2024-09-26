import { createServerFn } from '@tanstack/start';
import { z } from 'zod';
export const withUseServer = createServerFn({
  method: 'GET'
}).handler((...args) => {
  "use server";

  args[0].input = (z.number())(args[0].input);
  return (({
    payload
  }) => payload + 1)(...args);
});