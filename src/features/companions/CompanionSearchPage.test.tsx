import { beforeEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AppStateProvider } from '../../store/AppStateProvider'
import { FeedbackProvider } from '../../components/Feedback'
import { getSnapshot, resetStoreForTests } from '../../store/appStore'
import { getDemoServiceDate } from '../../domain/fixtures'
import { CompanionSearchPage } from './CompanionSearchPage'

beforeEach(() => { cleanup(); localStorage.clear(); resetStoreForTests() })

function renderSearch(query = '') {
  render(<AppStateProvider><FeedbackProvider><MemoryRouter initialEntries={['/companions' + query]}><CompanionSearchPage /></MemoryRouter></FeedbackProvider></AppStateProvider>)
}

describe('companion package booking', () => {
  it('shows the current service date, route options, and package information', () => {
    renderSearch()
    expect(screen.getByLabelText('服務日期')).toHaveValue(getDemoServiceDate())
    expect(screen.getByRole('combobox', { name: '服務路線' })).toHaveValue('花東縱谷台9線')
    for (const route of ['花東太魯閣', '東海岸台11線', '花東縱谷台9線', '南迴路線']) {
      expect(screen.getByRole('option', { name: route })).toBeInTheDocument()
    }
    expect(screen.getByText('預約流程')).toBeInTheDocument()
    expect(screen.getByText(/示意旅伴名單/)).toBeInTheDocument()
    expect(screen.queryByRole('spinbutton', { name: /分鐘|時薪/ })).not.toBeInTheDocument()
  })

  it('submits the half-day total per traveler and retains the meeting point and notes', async () => {
    const user = userEvent.setup()
    renderSearch()
    await user.click(screen.getAllByRole('button', { name: /提出預約需求/ })[0])
    const dialog = screen.getByRole('dialog', { name: '提出旅伴預約需求' })
    expect(dialog.parentElement).toBe(document.body)
    expect(within(dialog).getByText('NT$ 2,000')).toBeInTheDocument()
    await user.clear(within(dialog).getByLabelText('集合位置'))
    await user.type(within(dialog).getByLabelText('集合位置'), '木日光入口')
    await user.type(within(dialog).getByLabelText('補充需求'), '希望協助英文溝通')
    await user.click(within(dialog).getByRole('button', { name: '送出預約需求' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(getSnapshot().serviceRequests[0]).toMatchObject({ date: getDemoServiceDate(), durationMinutes: 240, partySize: 2, price: 2000, meetingPoint: '木日光入口', notes: '希望協助英文溝通', status: 'pending' })
  })

  it('charges the full-day per-person total and searches for the full eight hours', async () => {
    const user = userEvent.setup()
    renderSearch()
    await user.click(screen.getByRole('radio', { name: /全日/ }))
    await user.click(screen.getAllByRole('button', { name: /提出預約需求/ })[0])
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByText('NT$ 3,600')).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: '送出預約需求' }))
    expect(getSnapshot().serviceRequests[0]).toMatchObject({ durationMinutes: 480, startTime: '09:00', price: 3600, revenueSnapshot: { duration: 'full-day', perPersonPrice: 1800, gross: 3600 } })
  })

  it('clears the default meeting point when the traveler changes the service route', async () => {
    const user = userEvent.setup()
    renderSearch('?startTime=14:00')
    await user.selectOptions(screen.getByRole('combobox', { name: '服務路線' }), '南迴路線')
    await user.click(screen.getAllByRole('button', { name: /提出預約需求/ })[0])
    expect(screen.getByLabelText('集合位置')).toHaveValue('')
  })

  it('replaces expired links with the next service date', () => {
    renderSearch('?date=2000-01-01')
    expect(screen.getByLabelText('服務日期')).toHaveValue(getDemoServiceDate())
  })
})
