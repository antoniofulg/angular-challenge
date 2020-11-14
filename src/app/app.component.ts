import { Component } from '@angular/core';
import axios, { AxiosInstance } from 'axios';

interface Pagination {
  totalItems: number,
  itemsPerPage: number,
  totalPages: number,
  currentPage: number,
  indexOfFirstItem: number
}

interface Evaluation {
  id: number,
  name: string
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
   
export class AppComponent {
  private axiosClient: AxiosInstance

  public loading:boolean = false
  public headers:Array<string> = ['ID', 'Nome']
  public evaluations:Array<Evaluation> = []
  public pageEvaluations:Array<Evaluation> = []
  public paginationInfo: Pagination = {
    totalItems: 0,
    itemsPerPage: 0,
    totalPages: 0,
    currentPage: 1,
    indexOfFirstItem: 0
  }

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
      this.evaluations = getEvaluationsInfo
      console.log(this.evaluations)
      this.getEvaluationsPaginationInfo(15, 1)
      this.loading = false
    } catch (error) {
      this.loading = false
      console.log(error)
    }
  }

  public setItemsPerPage(itemsPerPage: number) {
    let currentPage = this.paginationInfo.currentPage
    const totalPages = this.evaluations.length / itemsPerPage
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

  private getEvaluationsPaginationInfo(itemsPerPage:number = 15, currentPage:number = 1) {
    this.paginationInfo.itemsPerPage = itemsPerPage
    this.paginationInfo.currentPage = currentPage
    this.paginationInfo.indexOfFirstItem = (
      (this.paginationInfo.currentPage - 1) * this.paginationInfo.itemsPerPage
    )
    this.paginationInfo.totalItems = this.evaluations.length
    this.paginationInfo.totalPages = this.evaluations.length / this.paginationInfo.itemsPerPage
    this.pageEvaluations = this.evaluations.slice(
      this.paginationInfo.indexOfFirstItem,
      this.paginationInfo.indexOfFirstItem + this.paginationInfo.itemsPerPage
    )
    console.log(this.paginationInfo)
  }
}
