## Brief overview
This rule file outlines guidelines for ensuring compliance with n8n's paired items rules, specifically for the Carbone integration project. These guidelines are derived from the task of updating the Carbone node to respect n8n's item linking requirements.

## n8n Paired Items Compliance
- Always ensure that the `pairedItem` property is set on all returned items in n8n nodes.
- The `pairedItem` property should include:
  - `item`: The index of the input item.
  - `input`: The input index (usually `0` unless the node combines multiple inputs).
- This is required for n8n to track which input item a given output item comes from, ensuring compatibility with other nodes that rely on item linking.

## Code Implementation
- When returning `INodeExecutionData` objects, include the `pairedItem` property in the returned object.
- Example:
  ```typescript
  return {
    json: { ... },
    pairedItem: {
      item: i,
      input: 0,
    },
  };
  ```

## Verification
- After making changes, verify compliance by running the build command (`npm run build`) to ensure the code compiles without errors.
- This confirms that the changes are syntactically correct and do not break existing functionality.

## Project-Specific Context
- This rule is particularly relevant for the Carbone integration, which involves managing templates and rendering documents via the Carbone.io API.
- Ensure that all methods returning `INodeExecutionData` in `TemplateOperations.ts` and `RenderOperations.ts` include the `pairedItem` property.
