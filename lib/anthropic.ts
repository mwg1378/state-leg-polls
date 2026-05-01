import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export const MODEL_FAST = 'claude-sonnet-4-6'
export const MODEL_SMART = 'claude-opus-4-7'
