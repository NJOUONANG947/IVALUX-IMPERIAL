-- =====================================================
-- IVALUX IMPERIAL - Complete RLS Policies
-- Run AFTER: migration-complete-schema.sql
-- =====================================================

-- =====================================================
-- ORDERS
-- =====================================================
CREATE POLICY "orders_select_own"
  ON public.orders FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "orders_insert_own"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "orders_update_own"
  ON public.orders FOR UPDATE
  USING (auth.uid() = client_id)
  WITH CHECK (auth.uid() = client_id);

-- Employees can read orders they're assigned to
CREATE POLICY "orders_select_employee"
  ON public.orders FOR SELECT
  USING (
    auth.uid() = employee_id
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('employee', 'admin'))
  );

-- Admin can read all orders
CREATE POLICY "orders_select_admin"
  ON public.orders FOR SELECT
  USING (public.is_admin());

CREATE POLICY "orders_update_admin"
  ON public.orders FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =====================================================
-- ORDER ITEMS
-- =====================================================
CREATE POLICY "order_items_select_own"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.client_id = auth.uid()
    )
  );

CREATE POLICY "order_items_select_admin"
  ON public.order_items FOR SELECT
  USING (public.is_admin());

-- =====================================================
-- INVOICES
-- =====================================================
CREATE POLICY "invoices_select_own"
  ON public.invoices FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "invoices_select_admin"
  ON public.invoices FOR SELECT
  USING (public.is_admin());

CREATE POLICY "invoices_insert_admin"
  ON public.invoices FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "invoices_update_admin"
  ON public.invoices FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =====================================================
-- PAYMENTS
-- =====================================================
CREATE POLICY "payments_select_own"
  ON public.payments FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "payments_insert_own"
  ON public.payments FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "payments_select_admin"
  ON public.payments FOR SELECT
  USING (public.is_admin());

CREATE POLICY "payments_update_admin"
  ON public.payments FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =====================================================
-- APPOINTMENTS
-- =====================================================
CREATE POLICY "appointments_select_own"
  ON public.appointments FOR SELECT
  USING (auth.uid() = client_id OR auth.uid() = employee_id);

CREATE POLICY "appointments_insert_client"
  ON public.appointments FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "appointments_insert_employee"
  ON public.appointments FOR INSERT
  WITH CHECK (
    auth.uid() = employee_id
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('employee', 'admin'))
  );

CREATE POLICY "appointments_update_own"
  ON public.appointments FOR UPDATE
  USING (auth.uid() = client_id OR auth.uid() = employee_id)
  WITH CHECK (auth.uid() = client_id OR auth.uid() = employee_id);

CREATE POLICY "appointments_select_admin"
  ON public.appointments FOR SELECT
  USING (public.is_admin());

-- =====================================================
-- MESSAGES
-- =====================================================
CREATE POLICY "messages_select_own"
  ON public.messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "messages_insert_own"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "messages_update_own"
  ON public.messages FOR UPDATE
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

CREATE POLICY "messages_select_admin"
  ON public.messages FOR SELECT
  USING (public.is_admin());

-- =====================================================
-- SUBSCRIPTIONS
-- =====================================================
CREATE POLICY "subscriptions_select_own"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "subscriptions_insert_own"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "subscriptions_update_own"
  ON public.subscriptions FOR UPDATE
  USING (auth.uid() = client_id)
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "subscriptions_select_admin"
  ON public.subscriptions FOR SELECT
  USING (public.is_admin());

-- =====================================================
-- CLIENT JOURNEY
-- =====================================================
CREATE POLICY "client_journey_select_own"
  ON public.client_journey FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "client_journey_insert_own"
  ON public.client_journey FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "client_journey_select_admin"
  ON public.client_journey FOR SELECT
  USING (public.is_admin());

-- =====================================================
-- ANALYTICS EVENTS
-- =====================================================
CREATE POLICY "analytics_events_insert_authenticated"
  ON public.analytics_events FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "analytics_events_select_admin"
  ON public.analytics_events FOR SELECT
  USING (public.is_admin());

-- =====================================================
-- LOYALTY POINTS
-- =====================================================
CREATE POLICY "loyalty_points_select_own"
  ON public.loyalty_points FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "loyalty_points_select_admin"
  ON public.loyalty_points FOR SELECT
  USING (public.is_admin());

CREATE POLICY "loyalty_points_update_admin"
  ON public.loyalty_points FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =====================================================
-- POINT TRANSACTIONS
-- =====================================================
CREATE POLICY "point_transactions_select_own"
  ON public.point_transactions FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "point_transactions_select_admin"
  ON public.point_transactions FOR SELECT
  USING (public.is_admin());

CREATE POLICY "point_transactions_insert_admin"
  ON public.point_transactions FOR INSERT
  WITH CHECK (public.is_admin());

-- =====================================================
-- QUESTS
-- =====================================================
CREATE POLICY "quests_select_authenticated"
  ON public.quests FOR SELECT
  TO authenticated
  USING (is_active = TRUE);

CREATE POLICY "quests_select_admin"
  ON public.quests FOR SELECT
  USING (public.is_admin());

CREATE POLICY "quests_insert_admin"
  ON public.quests FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "quests_update_admin"
  ON public.quests FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =====================================================
-- CLIENT QUESTS
-- =====================================================
CREATE POLICY "client_quests_select_own"
  ON public.client_quests FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "client_quests_insert_own"
  ON public.client_quests FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "client_quests_update_own"
  ON public.client_quests FOR UPDATE
  USING (auth.uid() = client_id)
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "client_quests_select_admin"
  ON public.client_quests FOR SELECT
  USING (public.is_admin());

-- =====================================================
-- REVIEWS
-- =====================================================
CREATE POLICY "reviews_select_authenticated"
  ON public.reviews FOR SELECT
  TO authenticated
  USING (is_approved = TRUE OR auth.uid() = client_id);

CREATE POLICY "reviews_insert_own"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "reviews_update_own"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = client_id)
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "reviews_select_admin"
  ON public.reviews FOR SELECT
  USING (public.is_admin());

CREATE POLICY "reviews_update_admin"
  ON public.reviews FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =====================================================
-- NOTIFICATIONS
-- =====================================================
CREATE POLICY "notifications_select_own"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "notifications_update_own"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notifications_insert_admin"
  ON public.notifications FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "notifications_select_admin"
  ON public.notifications FOR SELECT
  USING (public.is_admin());
