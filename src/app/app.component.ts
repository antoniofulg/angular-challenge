import { Component } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import axios, { AxiosInstance } from 'axios';

interface Pagination {
  totalItems: number,
  itemsPerPage: number,
  totalPages: number,
  currentPage: number,
  indexOfFirstItem: number,
  availablePages: Array<number>
}

interface Evaluation {
  id: number,
  name: string
}

interface EvaluationCounter {
  id: number,
  name: string,
  counter: number
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
   
export class AppComponent {
  private axiosClient: AxiosInstance

  public allEvaluationsList:Array<Evaluation> = []
  public evaluationsList:Array<Evaluation> = []
  public headers: Array<string> = ['ID', 'Nome']
  public lastFiveNonRepeatedEvaluationList:Array<EvaluationCounter> = []
  public loading:boolean = false
  public mostRepeatedEvaluation:EvaluationCounter
  public nonRepeatedEvaluationList:Array<any> = []
  public pageEvaluations:Array<Evaluation> = []
  public paginationInfo: Pagination = {
    totalItems: 0,
    itemsPerPage: 0,
    totalPages: 0,
    currentPage: 1,
    indexOfFirstItem: 0,
    availablePages: []
  }
  public showRepeatedEvaluationsOnList:Boolean = false

  constructor() {
    this.axiosClient = axios.create({
      timeout: 3000,
    })
  }

  ngOnInit(): void {
    this.getEvaluations();
  }

  public async getEvaluations() {
    try {
      this.loading = true
      const { getEvaluationsInfo } = (await this.axiosClient.get('https://simulados.evolucional.com.br/painel/json/get-evaluations-without-questions')).data
      this.allEvaluationsList = getEvaluationsInfo
      this.getNonRepeatedEvaluation()
      this.switchEvaluationShowList()
      this.getEvaluationsPaginationInfo(15, 1)
      this.loading = false
    } catch (error) {
      this.loading = false
      console.log(error)
    }
  }

  public setItemsPerPage(itemsPerPage: number) {
    let currentPage = this.paginationInfo.currentPage
    const totalPages = this.allEvaluationsList.length / itemsPerPage
    if (currentPage > totalPages) 
      currentPage = totalPages
    this.getEvaluationsPaginationInfo(itemsPerPage, currentPage)
  }

  public nextPage() {
    this.getEvaluationsPaginationInfo(this.paginationInfo.itemsPerPage, this.paginationInfo.currentPage + 1)
  }

  public previousPage() {
    this.getEvaluationsPaginationInfo(this.paginationInfo.itemsPerPage, this.paginationInfo.currentPage - 1)
  }

  public goToPage(pageNumber:number) {
    this.getEvaluationsPaginationInfo(this.paginationInfo.itemsPerPage, pageNumber)
  }

  private getAvailablePages() {
    this.paginationInfo.availablePages = []
    let firstPage = 0
    let lastPage = 0
    const finalDiff = this.paginationInfo.totalPages - this.paginationInfo.currentPage
    if (this.paginationInfo.currentPage > 3) {
      if (finalDiff > 3) {
        firstPage = this.paginationInfo.currentPage - 3
        lastPage = this.paginationInfo.currentPage + 3
      } else {
        firstPage = this.paginationInfo.currentPage - (3 + (3 - finalDiff))
        lastPage = this.paginationInfo.currentPage + finalDiff
      }
    } else {
      firstPage = 1
      lastPage = 7
    }
    for (let i = firstPage; i <= lastPage; i++) {
      this.paginationInfo.availablePages.push(i)
    }
  }

  private getEvaluationsPaginationInfo(itemsPerPage:number = 15, currentPage:number = 1) {
    this.paginationInfo.itemsPerPage = itemsPerPage
    this.paginationInfo.currentPage = currentPage
    this.paginationInfo.indexOfFirstItem = (
      (this.paginationInfo.currentPage - 1) * this.paginationInfo.itemsPerPage
    )
    this.paginationInfo.totalItems = this.evaluationsList.length
    this.paginationInfo.totalPages = Math.ceil(this.evaluationsList.length / this.paginationInfo.itemsPerPage)
    this.pageEvaluations = this.evaluationsList.slice(
      this.paginationInfo.indexOfFirstItem,
      this.paginationInfo.indexOfFirstItem + this.paginationInfo.itemsPerPage
    )
    this.getAvailablePages()
  }

  private getNonRepeatedEvaluation() {
    this.allEvaluationsList.map((evaluation) => {
      let indexOfEvaluation: number = -1
      if (this.nonRepeatedEvaluationList.length) {
        this.nonRepeatedEvaluationList.map((item: { id: number; name: string; counter: number }, index:number) => {
          if (item.name === evaluation.name) {
            indexOfEvaluation = index
          }
        })
      }
      if (indexOfEvaluation > -1) {
        this.nonRepeatedEvaluationList[indexOfEvaluation].counter++
      } else {
        this.nonRepeatedEvaluationList.push({
          ...evaluation,
          counter: 1
        })
      }
    })
    this.lastFiveNonRepeatedEvaluationList = this.nonRepeatedEvaluationList.slice(-5)
    this.getMostRepeatedEvaluation()
  }

  private getMostRepeatedEvaluation() {
    let controlEvaluation: EvaluationCounter
    this.nonRepeatedEvaluationList.map(evaluation => {
      if (!(controlEvaluation?.counter > evaluation.counter)) {
        controlEvaluation = evaluation
      }
    })
    this.mostRepeatedEvaluation = controlEvaluation
  }

  public switchEvaluationShowList(switcher: Boolean = false) {
    if (switcher) {
      this.showRepeatedEvaluationsOnList = !this.showRepeatedEvaluationsOnList
    }
    if (this.showRepeatedEvaluationsOnList) {
      this.evaluationsList = this.allEvaluationsList
    } else {
      this.evaluationsList = this.nonRepeatedEvaluationList
    }
    this.getEvaluationsPaginationInfo(this.paginationInfo.itemsPerPage)
  }
}
