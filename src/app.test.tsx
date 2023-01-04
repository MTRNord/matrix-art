import { App } from './app'
import { render, screen } from './utils/test-utils'

describe('First load tests', () => {
    it('The Explore page is default', () => {
        render(<App />)
        expect(screen.getByText(/Explore/i)).toBeInTheDocument()
    })
})