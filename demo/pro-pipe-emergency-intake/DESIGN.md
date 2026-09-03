# Pro Pipe Emergency Intake — Design Notes

## Purpose

This is a static, synthetic concept for an Emergency Callback Intake Sprint. It demonstrates how urgency, service location, callback timing, consent, staff priority, customer confirmation and a 24-hour unresolved summary can fit around an existing callback workflow.

It is not connected to Pro Pipe's website, inbox, dispatch software, phone line or customer data. Nothing submitted leaves the browser and no technician is automatically dispatched.

## Experience

- Mobile-first two-path intake: emergency and standard.
- Emergency choice keeps the phone path prominent and describes a priority callback target without promising response or service.
- Confirmation records the selected priority, callback target and human-dispatch boundary.
- Dispatcher queue is an interactive synthetic preview; operators can filter requests and resolve/reopen sample items.
- A 24-hour summary highlights open, urgent and aged requests without sending anything.

## Visual system

- Deep navy operational canvas with high-visibility safety orange for urgent states.
- Warm white content surfaces keep the customer intake approachable.
- Condensed display typography is approximated with system fonts to keep the demo dependency-free.
- Status color is always paired with text/iconography; focus rings, semantic labels and live regions support keyboard and assistive-technology use.

## Product boundaries

- Preserve the existing emergency phone and backend paths in a real implementation.
- No CRM replacement, automatic dispatch, field-service writes, emergency-response guarantee, marketing SMS or payment collection.
- Production implementation requires approved urgency definitions, receipt language, routing and test recipients.

