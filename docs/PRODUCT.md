# CoachSpace — Product Definition

> CoachSpace is a provisional product name. Product assumptions must be validated with coaches.

## 1. Product Summary

CoachSpace is a mobile-first web application designed to help sports coaches manage the communication and organisation surrounding their training groups.

The concept brings group communication, announcements, training schedules, attendance, and exercise resources together in one place.

The initial goal is not to build a complete commercial platform. It is to create a convincing interactive demo, show it to coaches, and determine whether the problem is important enough to justify further development.

## 2. Problem Hypotheses

Coaches may currently use several separate tools to manage their work:
- WhatsApp or similar messaging applications for group communication.
- Separate calendars or messages for training schedules and changes.
- Spreadsheets, notes, or memory to track attendance.
- Video links, cloud folders, or old messages to store and share exercises.
- Repeated messages to communicate the same information to multiple groups.

This fragmentation could make information difficult to find and create repetitive administrative work.

**These are hypotheses, not validated facts.** Some coaches may already have an effective workflow or may not consider this problem important. Interviews must establish what actually happens.

### Questions to investigate
- Which tools do coaches currently use?
- What information is most difficult to find?
- How often do schedule changes or messages get missed?
- How do coaches record and review attendance?
- How do they share exercises and technique videos?
- Which tasks take unnecessary time?
- What would make them adopt another tool?

## 3. Target Customers

### Primary customer

An independent sports coach or small sports academy that manages recurring groups and needs to coordinate training, communication, or exercise resources.

### Initial segment to investigate

The first discipline has **not been chosen yet**. Initial research will cover coaches in:
- Tennis
- Football
- Basketball
- Pilates

This includes individual coaches and small academies. Interviews should help decide which discipline to focus on first. The demo uses fictional groups from all four disciplines until that decision is made.

### User roles

**Coach**
- Manages groups and participants.
- Shares announcements.
- Organises training sessions.
- Tracks attendance.
- Shares exercises and videos.
- Communicates with groups or individuals.

**Participant**
- Views announcements and schedules.
- Accesses relevant group information.
- Reads messages.
- Views exercises and technique videos.

The first demo may show both perspectives using fictional data.

## 4. Value Proposition

**Working proposition:**

"Give your team one clear place for training communication, schedules, attendance, and exercises, accessible from a phone or computer."

### Core differentiator: one coach, many groups, one library

The coach saves an exercise once and reuses it across groups. For each group they can adapt the instructions, and they can assign it to the whole group or only to selected participants. This fits small academies and coaches who work with several teams (see D-022).

This is a hypothesis to test in interviews: similar exercise-assignment features exist in other tools, so the value must come from combining it with group communication in a simple, multi-discipline product.

Potential benefits to test:
- Less time searching through messages and links.
- Easier access to current training information.
- A clearer overview of upcoming sessions.
- Easier sharing and reuse of exercises across groups.
- A more organised experience for participants.

Do not claim measured time savings or improved athletic performance without evidence.

## 5. Business Model Hypothesis

- Coaches or academies are the intended paying customers.
- Participants use the platform for free through their coach.
- Subscription billing is not part of the first demo.

Initial prices to test in conversations:
- Approximately €9.90/month for an early pilot or founding-coach offer.
- Approximately €19.90/month as a possible individual-coach price.

These are starting hypotheses, not validated prices or commitments. Do not implement payment flows or hard-code pricing until the product owner approves a pricing model based on customer evidence.

Questions to investigate:
- Who decides whether to pay?
- Would the coach pay personally, or would an academy pay?
- What problem would justify a recurring subscription?
- Which features are essential at the proposed price?
- What would prevent adoption?

## 6. Demo Scope

The first version is an interactive demo using fictional data.

### Required areas

1. **Coach dashboard**
   - Overview of groups.
   - Upcoming sessions.
   - Recent announcements.
   - Simple attendance summary.

2. **Groups and participants**
   - Group list.
   - Group details.
   - Fictional participant list.

3. **Chat interface**
   - Group chat.
   - One-to-one chat interface if practical.
   - Example messages.
   - Simulated local interactions where appropriate.

4. **Announcements**
   - Clearly distinguish announcements from ordinary messages.
   - Show example updates relevant to a team.

5. **Training calendar**
   - Upcoming sessions with dates, times, and group information.

6. **Attendance**
   - Demonstrate how attendance could be marked or reviewed.

6b. **Session management, session builder and coach memory** (integrated coaching workflow)
   - Add one-off sessions; reschedule, move or cancel one session without changing the weekly schedule; changes visible everywhere, including the participant view.
   - Build a session plan from library exercises in warm-up, technical, tactical and cool-down blocks, with order, duration and plan-specific instructions.
   - Save plans as reusable templates and adapt templates for a group; originals stay intact.
   - Three short notes after each session (what worked, what to improve, what to revisit), shown again when preparing that group's next session.

7. **Exercise library (core differentiator)**
   - One shared library per coach: title, discipline, category, duration, equipment, base instructions.
   - External video links (no video hosting).
   - Assign an exercise to several groups, with group-specific instructions.
   - Assign to the whole group or only to selected participants.
   - Create new exercises in the demo.

8. **Participant view**
   - Relevant schedule.
   - Announcements.
   - Exercises and group information.

9. **Responsive interface**
   - Usable on mobile and desktop.

## 7. Demo Limitations

The demo may use hard-coded sample data or local state.

- Do not imply that a message reaches another user.
- Do not claim data persists in the cloud unless this has been implemented and verified.
- Do not use real athletes' personal information.
- Do not present simulated authentication, notifications, or attendance synchronisation as real.
- Every visible control must work or be labelled `Coming soon`.

## 8. Out of Scope for the First Demo

Do not build these features without explicit approval:
- Native iOS or Android applications.
- Production authentication or account recovery.
- Real-time multi-user chat.
- Production database and permission system.
- Subscription billing.
- Push notifications, SMS, or email campaigns.
- Complex analytics or performance tracking.
- AI coaching or wearable integrations.
- Hosting large video files ourselves.
- Public social feeds or athlete marketplaces.
- Advanced academy administration or payroll.

These features may be reconsidered after validation.

## 9. Validation Plan

The goal is to learn whether coaches experience a meaningful recurring problem and whether the proposed product is worth adopting and paying for.

### Initial targets

- Interview 5–10 coaches.
- Demonstrate the prototype to at least 5 relevant coaches.
- Identify recurring problems and current workarounds.
- Aim for 2–3 coaches willing to commit to a defined pilot.
- Seek at least one concrete willingness-to-pay signal, such as acceptance of a paid pilot or a specific offer.

These are targets, not guaranteed outcomes.

### Questions to ask

1. How do you currently manage communication and training organisation?
2. What is the most frustrating recurring task?
3. How frequently does this problem occur?
4. What happens when information is missed or hard to find?
5. Which existing tools would this product need to replace or complement?
6. Which part of the demo would you use first?
7. What would prevent you from using it?
8. Who would pay for it?
9. Would you try a pilot? Under what conditions?
10. Would you pay the proposed price? Why or why not?

Compliments and hypothetical interest are not proof of demand. Record objections and concrete commitments.

## 10. Success Criteria

### Demo success
- Coaches understand the concept during a short walkthrough.
- The main screens and navigation work.
- The interface is usable on mobile and desktop.
- Simulated features are represented honestly.

### Validation success
- Interviews reveal repeated, meaningful problems.
- Coaches can explain the value in their own words.
- Some coaches agree to a pilot or a concrete next step.
- Pricing is tested directly rather than assumed.

### Later pilot success
- Coaches invite participants.
- Users return to the product for recurring tasks.
- The product solves a problem that justifies continued use and potentially payment.

## 11. Product Principles

- Coach-first: prioritise recurring coaching workflows.
- Simple over comprehensive: make the main actions easy to understand.
- Mobile-first: athletes should be able to use the app on their phones.
- Evidence before investment: validate demand before building expensive infrastructure.
- Honest functionality: distinguish simulated features from real features.
- Privacy by default: use fictional data during the demo.
- Incremental development: build and test one coherent feature at a time.
