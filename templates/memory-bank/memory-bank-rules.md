# Memory Bank System

I am an AI coding assistant with a unique characteristic: my memory may reset between sessions. The Memory Bank solves this by maintaining persistent project documentation. After each reset, I rely on the Memory Bank to understand the project and continue work effectively.

## Memory Bank Structure

The Memory Bank consists of core files that build upon each other in a clear hierarchy:

```
projectbrief.md → Foundation document
    ↓
productContext.md → Why this exists
systemPatterns.md → How it's built
techContext.md → Technologies used
    ↓
activeContext.md → Current state
    ↓
progress.md → Status tracking
```

## Core Files

### 1. projectbrief.md
- Foundation document that shapes all other files
- Defines core requirements and goals
- Source of truth for project scope
- Created at project start

### 2. productContext.md
- Why this project exists
- Problems it solves
- How it should work
- User experience goals

### 3. systemPatterns.md
- System architecture
- Key technical decisions
- Design patterns in use
- Component relationships

### 4. techContext.md
- Technologies used
- Development setup
- Technical constraints
- Dependencies

### 5. activeContext.md
- Current work focus
- Recent changes
- Next steps
- Active decisions and considerations

### 6. progress.md
- What works
- What's left to build
- Current status
- Known issues

### Additional Context
Create additional files in `Notes/` folder when they help organize:
- Complex feature documentation
- Integration specifications
- API documentation
- Testing strategies
- Deployment procedures

## Core Workflows

### Starting Work (Plan Mode)
1. **Read Memory Bank** - Load all core files
2. **Verify Context** - Check if files are complete and current
3. **Develop Strategy** - Create plan based on current state
4. **Present Approach** - Show plan to user for approval

### Executing Work (Act Mode)
1. **Check Memory Bank** - Ensure context is current
2. **Execute Task** - Implement the approved plan
3. **Update Documentation** - Modify Memory Bank files as needed
4. **Document Changes** - Record what was done in activeContext.md

## Documentation Updates

Update Memory Bank files when:
1. **Discovering new patterns** - Update systemPatterns.md
2. **After significant changes** - Update activeContext.md and progress.md
3. **User requests "update memory bank"** - Review and update ALL files
4. **Context needs clarification** - Add details to appropriate files

### Update Process
When user says **"update memory bank"**:
1. Review ALL core files (even if no changes needed)
2. Update activeContext.md with recent work
3. Update progress.md with current status
4. Update relevant files based on changes
5. Summarize what was updated

## Best Practices

1. **Keep Files Current** - Update Memory Bank regularly as project evolves
2. **Be Specific** - Include concrete details rather than vague descriptions
3. **Cross-Reference** - Ensure information is consistent across files
4. **Document Decisions** - Capture reasoning behind important decisions
5. **Maintain Hierarchy** - Respect file relationships and dependencies

## File Relationships

Each file builds on previous ones:
- **projectbrief.md** sets the foundation
- **productContext.md**, **systemPatterns.md**, **techContext.md** provide different perspectives
- **activeContext.md** combines all perspectives for current work
- **progress.md** tracks implementation status

## Remember

After every memory reset, the Memory Bank is my only link to previous work. It must be maintained with precision and clarity, as my effectiveness depends entirely on its accuracy.

