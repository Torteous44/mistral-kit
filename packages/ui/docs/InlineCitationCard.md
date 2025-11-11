# InlineCitationCard
Radix HoverCard root configured for zero open/close delay so citation sources appear instantly.

## Usage
```tsx
<InlineCitationCard>
  <InlineCitationCardTrigger sources={sources} className="rounded-full border px-3 py-1 text-xs" />
  <InlineCitationCardBody className="w-72 rounded-2xl border bg-white p-4 shadow-xl">
    ...source content...
  </InlineCitationCardBody>
</InlineCitationCard>
```

## Props
| name | type | optional | default | description |
| ---- | ---- | -------- | ------- | ----------- |
| ...hoverCardProps | `React.ComponentProps<typeof HoverCard.Root>` | true |  | All Radix HoverCard root props (open, defaultOpen, onOpenChange, etc.). |

## Details
* Sets `openDelay`/`closeDelay` to `0` by default so cards appear/disappear immediately, matching chat UX expectations.
