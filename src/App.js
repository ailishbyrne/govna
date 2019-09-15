import React, { Component } from 'react';
import { SelectionControlGroup, DataTable, TableHeader, TableBody, TableRow, TableColumn } from 'react-md'
import { map, sortBy, omit, values } from 'lodash'

const SUPER_SECRET_KEY = 'AIzaSyAVvLfbGth0Gt6V2eGrDcJRIBICHr-ATJ4'
const STATE_CODES = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY']
const SORT_TYPE_STATE = {
  value: 'stateName',
  label: 'State Name'
}
const SORT_TYPE_GOVERNOR = {
  value: 'governorName',
  label: 'Governor Name'
}

export default class App extends Component {
  constructor() {
    super()
    this.state = {}
  }

  async componentDidMount() {
    await window.gapi.load('client')
    await window.gapi.client.init({ apiKey: SUPER_SECRET_KEY })
    await window.gapi.client.load('https://www.googleapis.com/discovery/v1/apis/civicinfo/v2/rest')
    this.setState({
      stateGovernors: await this.getStateGovernors(),
    })
  }

  getStateGovernors = async () => {
    const governorApiResponses = await Promise.all(
      map(STATE_CODES, stateCode => {
        return window.gapi.client.civicinfo.representatives.representativeInfoByDivision({
          ocdId: `ocd-division/country:us/state:${stateCode.toLowerCase()}`,
          levels: ['administrativeArea1'],
          roles: ['headOfGovernment']
        })
      })
    )
    return map(governorApiResponses, apiResponse => {
      const data = values(omit(apiResponse.result, 'offices'))
      return {
        stateName: values(data[0])[0].name,
        governorName: data[1][0].name
      }
    })
  }

  onSortTypeChange = (value) => {
    this.setState({
      stateGovernors: sortBy(this.state.stateGovernors, value)
    })
  }

  render () {
    const { stateGovernors } = this.state
    return (
      <div>
        <SelectionControlGroup
          id={'sortType' }
          name={'Sort Type'}
          label={'Sort by: '}
          controls={[SORT_TYPE_STATE, SORT_TYPE_GOVERNOR]}
          defaultValue={SORT_TYPE_STATE.value}
          onChange={this.onSortTypeChange}
          type={'radio'}
        />
        <DataTable plain>
          <TableHeader>
            <TableRow>
              <TableColumn>
                {SORT_TYPE_STATE.label}
              </TableColumn>
              <TableColumn>
                {SORT_TYPE_GOVERNOR.label}
              </TableColumn>
            </TableRow>
          </TableHeader>
          <TableBody>
            {map(stateGovernors, stateGovernor => (
              <TableRow>
                <TableColumn>
                  {stateGovernor.stateName}
                </TableColumn>
                <TableColumn>
                  {stateGovernor.governorName}
                </TableColumn>
              </TableRow>
            ))}
          </TableBody>
        </DataTable>
     </div>
    )
  }
}
