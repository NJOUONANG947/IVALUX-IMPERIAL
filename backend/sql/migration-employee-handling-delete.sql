-- Allow employees to delete their own product handling assignments
-- Run this migration to enable the "Remove" feature on employee products page

CREATE POLICY "employee_handling_delete_own"
  ON public.employee_product_handling FOR DELETE
  USING (
    auth.uid() = employee_id
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('employee', 'admin'))
  );
